import {expect} from 'chai'
import sinon from 'sinon'
import {fetchData} from "../src/fetcher"

describe('fetchData', function () {
    it('Should perform fetch normally', async function () {
        const fetcher = sinon.fake.returns({ test: true });
        const config = {
            method: 'GET',
            url: 'test'
        }

        const response = await fetchData(fetcher, {}, config, {})

        expect(response).to.have.property('test')

        expect(fetcher.called)
        expect(fetcher.getCall(0).args[0]).to.nested.include(config)
    })

    it('Should parse returned value', async function () {
        const fetcher = sinon.fake.returns({ test: { nested: true } });
        const config = {
            method: 'GET',
            url: 'test'
        }

        const response = await fetchData(fetcher, {
            afterResponse: data => data.test
        }, config, {})

        expect(response).to.not.have.property('test')
        expect(response).to.have.property('nested')

        expect(fetcher.called)
        expect(fetcher.getCall(0).args[0]).to.include(config)
    })

    it('Should replace beforeRequest', async function () {
        const fetcher = sinon.fake.returns({ test: true });
        const config = {
            method: 'GET',
            url: 'test'
        }

        const response = await fetchData(fetcher, {
            beforeRequest: config => ({...config, url: 'newurl'})
        }, config, {})

        expect(response).to.have.property('test')

        expect(fetcher.called)
        expect(fetcher.calledWithMatch({...config, url: 'newurl'}))
    })

    it('Should perform fetch normally without config', async function () {
        const fetcher = sinon.fake.returns({ test: true });
        const config = {
            method: 'GET',
            url: 'test'
        }

        const response = await fetchData(fetcher, undefined, config, undefined)

        expect(response).to.have.property('test')

        expect(fetcher.called)
        expect(fetcher.getCall(0).args[0]).to.nested.include({url: 'test'})
    })

    it('Should replace url before request', async function () {
        const fetcher = sinon.fake.returns({ test: true });
        const config = {
            method: 'GET',
            url: 'test',
            parseRequestConfig: conf => ({...conf, url: 'replaced'})
        }

        const response = await fetchData(fetcher, undefined, config, undefined)

        expect(response).to.have.property('test')

        expect(fetcher.called)
        expect(fetcher.getCall(0).args[0]).to.nested.include({url: 'replaced'})
    })

    it('Should replace data before request', async function () {
        const fetcher = sinon.fake.returns({ test: true });
        const config = {
            method: 'GET',
            url: 'test',
            parseRequestData: data => ({...data, extraData: true})
        }

        const response = await fetchData(fetcher, undefined, config, {normalData: true})

        expect(response).to.have.property('test')

        expect(fetcher.called)
        expect(fetcher.getCall(0).args[0]).to.have.nested.property('data.extraData')
    })

    it('Should replace data after request', async function () {
        const fetcher = sinon.fake.returns({ test: true });
        const config = {
            method: 'GET',
            url: 'test',
            parseResponseData: data => ({...data, extraData: true})
        }

        const response = await fetchData(fetcher, undefined, config, undefined)

        expect(response).to.have.property('test')
        expect(response).to.have.property('extraData')

        expect(fetcher.called)
    })

    it('Should throw error on failure', async function () {
        const fetcher = sinon.fake.throws();
        const config = {
            method: 'GET',
            url: 'test'
        }

        let throwed = false

        try{
            await fetchData(fetcher, undefined, config, undefined)
        } catch (e) {
            throwed = true
        }

        expect(throwed).to.be.true
    })

    it('Should not throw error on failure', async function () {
        const fetcher = sinon.fake.throws();
        const config = {
            method: 'GET',
            url: 'test'
        }
        const fetcherConfig = {
            onError: () => ({ success: false })
        }

        let throwed = false
        let response

        try{
            response = await fetchData(fetcher, fetcherConfig, config, undefined)
        } catch (e) {
            throwed = true
        }

        expect(throwed).to.be.false
        expect(response).to.have.property('success')
    })
})